import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button';
import '@polymer/paper-card';
import '@polymer/app-layout/app-layout';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-image';
import '@polymer/iron-ajax';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/app-storage/app-localstorage/app-localstorage-document';

/**
 * @customElement
 * @polymer
 */
class PlanetsApp extends PolymerElement {
    static get template() {
        return html`
      <style>
          :host {
            display: block;
            font-family: Roboto, Noto, sans-serif;
          }
          paper-button {
            color: white;
          }
          paper-button.another {
            background: var(--paper-blue-500);
            width: 100%;
          }
          paper-button.another:hover {
            background: var(--paper-light-blue-500);
          }
          paper-button.answer {
            background: var(--paper-purple-500);
            flex-grow: 1;
          }
          paper-button.answer:hover {
            background: var(--paper-pink-500);
          }
          paper-button.reset {
            background: var(--paper-red-500);
            width: 100%;
          }
          paper-button.reset:hover {
            background: var(--paper-red-800);
          }
          app-toolbar {
            background-color: var(--paper-blue-500);
            color: white;
          }
          iron-image {
            width: 100%;
            --iron-image-width: 100%;
             background-color: white;
          }
          #planet-image-container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
          }
          #planet-image {
            max-width: 600px;
            background: url("data/images/bg.jpg");
            width: 100%;
            margin: 0 auto;
          }
          .flex {
            @apply --layout-horizontal;
            @apply --layout-around-justified;
          }
          .flexchild {
            @apply --layout-flex;
            margin: 3px;
          }
          .green {
            --paper-card-background-color: var(--paper-green-500);
          }
          .red {
            --paper-card-background-color: var(--paper-red-500);
          }
          paper-card.red, paper-card.green {
            color: white;
            --paper-card-header-color: white;
          }     
      </style>
      <app-localstorage-document key="noOfCorrect" data="{{noOfCorrectAnswers}}">
      </app-localstorage-document>
      <app-localstorage-document key="noOfIncorrect" data="{{noOfIncorrectAnswers}}">
      </app-localstorage-document>
      <app-header>
        <app-toolbar>
            <div main-title>Bu gezegenin ismi nedir?</div>
        </app-toolbar>
      </app-header>
      <iron-ajax
        auto
        url="data/planets.json"
        handle-as="json"
        on-response="_handleResponse">
      </iron-ajax>
      <div id="planet-image-container">
          <div id="stats" class="container flex">
              <paper-card class="green flexchild">
                <div class="card-actions">
                  <paper-icon-button icon="icons:check"></paper-icon-button>
                  <span>[[noOfCorrectAnswers]]</span>
                </div>
              </paper-card>
              <paper-card class="red flexchild">
                <div class="card-actions">
                  <paper-icon-button icon="icons:clear"></paper-icon-button>
                  <span>[[noOfIncorrectAnswers]]</span>
                </div>
              </paper-card>
          </div>
          <div id="planet-image">
              <iron-image 
                id="planet-image"
                preload fade
                src="data/images/planets/[[correctAnswer.code]].png">
              </iron-image>          
          </div>
          <div id="answer-button-container" class="container flex">
            <paper-button id="optionA" class="answer flexchild" on-click="_selectAnswer" disabled="[[answered]]">[[planetA.name]]</paper-button>
            <paper-button id="optionB" class="answer flexchild" on-click="_selectAnswer" disabled="[[answered]]">[[planetB.name]]</paper-button>
          </div>
          <div id="message-container" class="container flex">
            <p class="flexchild">[[outputMessage]]</p>
          </div>
          <div id="another-button-container" class="container flex">
            <paper-button class="another flexchild" id="another" on-click="_newQuestion" disabled="[[!answered]]">Sonraki</paper-button> 
          </div>
          <div id="reset-button-container" class="container flex">
            <paper-button class="reset flexchild" id="reset" on-click="_reset">Sıfırla!</paper-button> 
          </div>          
      </div>
    `;
    }

    static get properties() {
        return {
            planetA: {
                type: Object,
            },
            planetB: {
                type: Object,
            },
            outputMessage: {
                type: String,
                value: ""
            },
            correctAnswer: {
                type: Object,
                value: {
                    "code": "BOS",
                    "name": "Boş"
                }
            },
            userAnswer: {
                type: String
            },
            planetData: {
                type: Object
            },
            planetList: {
                type: Array,
                value: []
            },
            disabled: {
                type: Boolean,
                value: false
            },
            noOfCorrectAnswers: {
                type: Number,
                value: 0
            },
            noOfIncorrectAnswers: {
                type: Number,
                value: 0
            },
            selectedVoice: {
                type: Object,
                value: undefined
            },
            speechActive: {
                type: Boolean,
                value: false
            }
        };
    }

    _selectAnswer(event) {
        this.answered = true;
        let clickedButton = event.target;
        this.userAnswer = clickedButton.textContent;
        if (this.userAnswer == this.correctAnswer.name) {
            this.noOfCorrectAnswers += 1;
            this.outputMessage = `Yaşasın! ${this.userAnswer} doğru cevap`;
        } else {
            this.noOfIncorrectAnswers += 1;
            this.outputMessage = `Maalesef! Doğru cevap ${this.correctAnswer.name} olmalıydı...`;
        }
        this._speak(this.outputMessage);
    }

    _handleResponse(event) {
        this.planetData = event.detail.response.planets;
        this._generatePlanetList();
    }

    _planetAddedToList(planet) {
        return this.planetList.find(function (plObj) {
            return (plObj.code === planet.code);
        });
    }

    _generatePlanetList() {
        let id = 0;
        while (this.planetList.length < this.planetData.length) {
            id = Math.floor(Math.random() * (this.planetData.length));
            if (this._planetAddedToList(this.planetData[id]) === undefined) {
                this.planetList.push(this.planetData[id]);
            }
        }
        this._defineAnswers();
    }

    _defineAnswers() {
        this.answered = false;
        this.outputMessage = "";

        let incorrectAnswer = undefined;

        let answerId = Math.floor(Math.random() * 2);

        this.planetA = this.planetList[0];
        this.planetB = this.planetList[1];

        incorrectAnswer = this.planetList[1 - answerId];

        this.correctAnswer = this.planetList[answerId];

        this.planetList.shift();
        this.planetList.shift();

        this.planetList.push(incorrectAnswer);

        this._speak("Resimdeki gezegenin ismi nedir?");
    }

    _newQuestion() {
        if (this.planetList.length < 2) {
            this._generatePlanetList();
        } else {
            this._defineAnswers();
        }
    }

    _reset() {
        this.askedPlanets = [];
        this.noOfIncorrectAnswers = 0;
        this.noOfCorrectAnswers = 0;
        window.localStorage.removeItem("noOfCorrect");
        window.localStorage.removeItem("noOfIncorrect");
        this._generatePlanetList();
    }

    _speak(text) {
        if (this.speechActive) {
            responsiveVoice.speak(text, "Turkish Male");
        }
    }

    ready() {
        super.ready();
        let speech = window.speechSynthesis;
        if (!speech) {
            this.speechActive = false;
            console.error("Konuşma etkin değil...")
        } else {
            this.speechActive = true;
        }
    }

}

window.customElements.define('planets-app', PlanetsApp);
