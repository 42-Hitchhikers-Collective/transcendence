/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:21:09 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/13 18:42:14 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//provides the one global GameManager instance for the app

import * as utils from "./gameManagerUtils";
export { utils };


import { GameManager } from "./gameManager";
import * as gameEventsModule from "./gameEvents";
import * as roomEventsModule from "./roomEvents";

const gameManagerInstance = new GameManager();

gameEventsModule.setGameManager(gameManagerInstance);
roomEventsModule.setGameManager(gameManagerInstance);

export const gameManager = {
  ...gameEventsModule,
  ...roomEventsModule
};