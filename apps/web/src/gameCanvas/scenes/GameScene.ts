import { Scene } from "phaser";
import { EventBus } from "../../events/EventBus";
import type { FrontendRoom } from "../types/roomTypes";
import { BoardManager } from "../managers/BoardManager";
import { InputManager } from "../managers/InputManager";
import { RenderManager } from "../managers/RenderManager";
import { UIManager } from "../managers/UIManager";

export class GameScene extends Scene {
  private room!: FrontendRoom;
  private myPlayerId: string = "";

  private boardManager!: BoardManager;
  private inputManager!: InputManager;
  private renderManager!: RenderManager;
  private uiManager!: UIManager;

  constructor() {
    super("Game");
  }

  // =========================
  // INIT
  // =========================

  init() {
  }

  create() {
    // Initialize managers
    this.boardManager = new BoardManager(this);
    const { pile, boardContainer } = this.boardManager.create();

    this.renderManager = new RenderManager(this, boardContainer);
    this.inputManager = new InputManager(this, pile);
    this.uiManager = new UIManager(this);

    this.inputManager.setup();

    // Setup event listeners
    EventBus.on("room_state", this.onRoomState, this);
    EventBus.on("show_colors", this.selectColor, this);
    //EventBus.on("PASS_TURN", this.onRoomState, this);
    EventBus.on("SOCKET_ERROR", this.onSocketError, this);

    this.events.once("shutdown", () => {
      EventBus.off("room_state", this.onRoomState, this);
      EventBus.off("SHOW_COLORS", this.selectColor, this);
      //EventBus.off("PASS_TURN", this.selectColor, this);
      EventBus.off("SOCKET_ERROR", this.onSocketError, this);
      this.uiManager.hideAll();
    });
  }

  private onRoomState(room: FrontendRoom) {
    this.room = room;

    if (!this.myPlayerId) {
      const observer = room.players.find(p => p.isTheObserver);
      if (observer) {
        this.myPlayerId = observer.id;
        this.renderManager.setMyPlayerId(observer.id);
      }
    }

    this.renderManager.render(room);
  }

  private selectColor() {
      this.uiManager.showWildColorButtons();
  }

  //private passTurn()
  //{
  //  this.
  //}
  private onSocketError(err: { message: string }) {
    console.error(err.message);
  }
}
