import { Scene } from "phaser";
import { EventBus } from "../../events/EventBus";
import type { FrontendRoom } from "../types/roomTypes";
import { BoardManager } from "../managers/BoardManager";
import { InputManager } from "../managers/InputManager";
import { RenderManager } from "../managers/RenderManager";
import { UIManager } from "../managers/UIManager";
import { Announcement } from "../managers/Announcemente";

const LOG = (msg: string) => console.log(`🕹️ PHASER: ${msg}`);

export class GameScene extends Scene {
  private room!: FrontendRoom;
  private myPlayerId: string = "";
  private myPlayerName: string = ""; // JESS: add player name to help you in better debugging

  private boardManager!: BoardManager;
  private inputManager!: InputManager;
  private renderManager!: RenderManager;
  private uiManager!: UIManager;
  private announcement!: Announcement;

  constructor() {
    super("Game");
  }

  // =========================
  // INIT
  // =========================

  init() {}

  create() {
    LOG("Creating GameScene..."); // JESS: keep this log to help with debugging tha game scene

    // Initialize managers
    this.boardManager = new BoardManager(this);
    const { pile, boardContainer } = this.boardManager.create();
    LOG("BoardManager initialized"); // JESS: keep this log to help with debugging tha game scene

    this.renderManager = new RenderManager(this, boardContainer);
    LOG("RenderManager initialized"); // JESS: keep this log to help with debugging tha game scene

    this.inputManager = new InputManager(this, pile);
    this.uiManager = new UIManager(this);
    this.announcement = new Announcement(this);

    this.inputManager.setup();
    LOG("InputManager initialized & setup"); // JESS: keep this log to help with debugging tha game scene
    LOG("UIManager initialized"); // JESS: keep this log to help with debugging tha game scene
    LOG("Announcement initialized"); // JESS: keep this log to help with debugging tha game scene

    this.cameras.main.centerOn(500, 400); // JESS: centers the camera on the game board (which is centered at 500, 400)

    // Setup event listeners
    EventBus.on("room_state", this.onRoomState, this);
    EventBus.on("show_colors", this.selectColor, this);
    EventBus.on("display_pass_button", this.passTurn, this);
    EventBus.on("uno", this.uno_announcemente, this);
    EventBus.on("not_turn", this.showNotTurn, this); // JESS: WE NEED AN EVENT BUS ALSO 
    LOG("  EventBus listeners registered");

    this.events.once("shutdown", () => {
      EventBus.off("room_state", this.onRoomState, this);
      EventBus.off("show_colors", this.selectColor, this);
      EventBus.off("display_pass_button", this.passTurn, this);
      EventBus.off("uno", this.uno_announcemente, this);
      EventBus.off("not_turn", this.showNotTurn, this);
      this.uiManager.hideAll();
      LOG("💀 GameScene shutdown — all listeners removed"); // JESS: keep this log to help with debugging tha game scene
    });

    LOG("GameScene ready"); // JESS: keep this log to help with debugging tha game scene
  }

  private onRoomState(room: FrontendRoom) {
    // Guard: prevent render before scene is fully initialized
    // if (!this.scene.isActive()) return;
    this.uiManager.hidePassTurnButtons(); // <---- MERGE CONFLICT: was added to resolve

    this.room = room;

    if (!this.myPlayerId) {
      const observer = room.players.find((p) => p.isTheObserver);
      if (observer) {
        this.myPlayerId = observer.id;
        this.myPlayerName = observer.userName; //  JESS: added player name for better debugging
        this.renderManager.setMyPlayerId(observer.id);
      }
    }

    // JESS: stored conditions in variables to simplify the logs and create less noise
    const turnName = room.players.find((p) => p.id === room.current_turn)?.userName ?? "Unknown";
    const isMyTurn = this.myPlayerId === room.current_turn; // JESS: we use the isMyTurn variable to simplify the conditions in the logs and in the guards for the user interactions with the game when it's not their turn
    this.inputManager.setCanPlay(isMyTurn); // JESS: we use the isMyTurn variable to set the canPlay flag in the input manager, which is used to guard the user interactions with the game when it's not their turn
    this.renderManager.setCanDraw(isMyTurn); // JESS: we use the isMyTurn variable to set the canDraw flag in the render manager, which is used to guard the user interactions with the draw pile when it's not their turn
    // JESS: added this log to show the game state in a more clear way, with the name of the player that is playing and the number of cards they have, and also if it's the observer or not, to help with debugging the game scene and understand better what's going on in the game
    if(turnName !== "Unknown") { 
      const myCards =
        room.players.find((p) => p.id === this.myPlayerId)?.cardCount ?? "?";
      LOG(`GAME STATE \n    Is ${turnName} 's turn is playing with ${myCards} cards`); // // JESS: keep this log to help with debugging tha game scene
      LOG(`OBSERVER STATE \n    Observer: ${this.myPlayerName} , Is my turn: ${isMyTurn}, Cards: ${myCards}`); // JESS: keep this log to help with debugging tha game scenn   
    }
    if (this.myPlayerId !== room.current_turn) {
      console.log(`🕹️ ${this.myPlayerName} - turn pass button hidden`); // JESS: added precision for debugging message to show better context to all team members
      this.uiManager.hidePassTurnButtons();
      this.uiManager.hideWildColorButtons(); // JESS: You also need to hide the wild color buttons to other players if it's not their turn, otherwise they will see the wild color buttons and get confused about why they are showing up
    }
    this.renderManager.render(room);
  }

  private selectColor() {
    if (this.myPlayerId !== this.room?.current_turn) return; // JESS: put a guard to prevent other players to see and interact with the wild color buttons if it's not their turn
    LOG("Wild card played — showing color picker");
    this.uiManager.showWildColorButtons();
  }

  private passTurn() {
    if (this.myPlayerId !== this.room?.current_turn) return; // JESS: put a guard to prevent other players to see and interact with the pass turn button if it's not their turn
    LOG(`${this.myPlayerName} passed turn`);
    this.uiManager.showPassTurnButtons();
  }

  private onSocketError(err: { message: string }) {
    console.error(`Socket error: ${err.message}`);
  }

  // JESS: THIS FUNCTION SHOW A MESSAGE WHEN THE USER INTERACTS WITH THE GAME BUT IT'S NOT THEIR TURN TO EXPLAIN WHY NOTHING HAPPENS, THIS IS IMPORTANT TO IMPROVE THE USER EXPERIENCE AND AVOID CONFUSION FOR NEW PLAYERS
  private showNotTurn() {
    const txt = this.add.text(500, 400, "It's not your turn yet", {
      fontSize: "36px",
      color: "#ff4444",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4,
    });
    txt.setOrigin(0.5);
    txt.setDepth(100);
    this.tweens.add({
      targets: txt,
      alpha: 0,
      y: 350,
      duration: 2000,
      onComplete: () => txt.destroy(),
    });
  }

  private uno_announcemente() {
    LOG("UNO! called"); // JESS: keep this log to help with debugging tha game scene
    this.announcement.uno();
  }
}
