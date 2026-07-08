/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:21:09 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/21 18:00:23 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//provides the one global GameManager instance for the app

import * as utils from "./dataToFrontend";
export { utils };

import * as gameManagerFunctions from "./gameManager";
import * as gameEventsModule from "./gameEvents";
import * as roomEventsModule from "./roomEvents";
import * as chatEventsModule from "./chatEvents";

export const gameManager = {
  ...gameManagerFunctions,
  ...gameEventsModule,
  ...roomEventsModule,
  ...chatEventsModule
};