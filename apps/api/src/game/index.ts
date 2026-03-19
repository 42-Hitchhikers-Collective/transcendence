/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:21:09 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/19 16:02:15 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//provides the one global GameManager instance for the app

import * as utils from "./gameManagerUtils";
export { utils };


import { GameManager } from "./gameManager";
export const gameManager = new GameManager();