/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ilazar <ilazar@student.42.de>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/05 13:21:09 by ilazar            #+#    #+#             */
/*   Updated: 2026/03/05 13:24:08 by ilazar           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//provides the one global GameManager instance for the app

import { GameManager } from "./gameManager";

export const gameManager = new GameManager();