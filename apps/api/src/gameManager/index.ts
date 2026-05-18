/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:21:09 by ilazar            #+#    #+#             */
/*   Updated: 2026/05/15 11:52:00 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//provides the one global GameManager instance for the app

import * as utils from "./dataToFrontend";
export { utils };

import * as gameManagerFunctions from "./gameManager";
import * as gameEventsModule from "./gameEvents";
import * as roomEventsModule from "./roomEvents";

export const gameManager = {
  ...gameManagerFunctions,
  ...gameEventsModule,
  ...roomEventsModule
};