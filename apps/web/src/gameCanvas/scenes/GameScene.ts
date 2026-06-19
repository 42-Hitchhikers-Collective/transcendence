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

    // Zoom camera so game content fills the canvas
    // Game content occupies roughly a 600x500 area centered at (500, 400)
    // Canvas is 1200x900, so zoom = min(1200/600, 900/500) ≈ 1.8
    this.cameras.main.setZoom(1.5);
    this.cameras.main.centerOn(500, 400);
    this.cameras.main.setBackgroundColor("#1e293b");

    // Setup event listeners
    EventBus.on("room_state", this.onRoomState, this);
    EventBus.on("show_colors", this.selectColor, this);
    EventBus.on("display_pass_button", this.passTurn, this);
    EventBus.on("uno", this.uno_announcemente, this);
    LOG("  EventBus listeners registered"); // JESS: keep this log to help with debugging tha game scene

    this.events.once("shutdown", () => {
      EventBus.off("room_state", this.onRoomState, this);
      EventBus.off("show_colors", this.selectColor, this);
      EventBus.off("display_pass_button", this.passTurn, this);
      EventBus.off("uno", this.uno_announcemente, this);
      this.uiManager.hideAll();
      LOG("💀 GameScene shutdown — all listeners removed"); // JESS: keep this log to help with debugging tha game scene
    });

    LOG("GameScene ready"); // JESS: keep this log to help with debugging tha game scene
  }

  private onRoomState(room: FrontendRoom) {
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
    if(turnName !== "Unknown") { // JESS: we log the info only if the game is started (when not started the turn is set to "Unknown" to avoid confusion in the logs)
      const isMyTurn = this.myPlayerId === room.current_turn;
      const myCards =
        room.players.find((p) => p.id === this.myPlayerId)?.cardCount ?? "?";
      LOG(`GAME STATE \n    Is ${turnName} 's turn is playing with ${myCards} cards`); // // JESS: keep this log to help with debugging tha game scene
      LOG(`OBSERVER STATE \n    Observer: ${this.myPlayerName} , Is my turn: ${isMyTurn}, Cards: ${myCards}`); // JESS: keep this log to help with debugging tha game scenn   
    }
    if (this.myPlayerId !== room.current_turn) {
      console.log(`🕹️ ${this.myPlayerName} - turn pass button hidden`); // JESS: added precision for debugging message to show better context to all team members
      this.uiManager.hidePassTurnButtons();
    }
    this.renderManager.render(room);
  }

  private selectColor() {
    LOG("Wild card played — showing color picker"); // JESS: keep this log to help with debugging tha game scene
    this.uiManager.showWildColorButtons();
  }

  private passTurn() {
    if (this.myPlayerId == this.room.current_turn) {
      LOG(`${this.myPlayerName} passed turn`); // JESS: keep this log to help with debugging tha game scene
      this.uiManager.showPassTurnButtons();
    }
  }

  private onSocketError(err: { message: string }) {
    console.error(`Socket error: ${err.message}`); // JESS: keep this log to help with debugging tha game scene
  }

  private uno_announcemente() {
    LOG("UNO! called"); // JESS: keep this log to help with debugging tha game scene
    this.announcement.uno();
  }
}
