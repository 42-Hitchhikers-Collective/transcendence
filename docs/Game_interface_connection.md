Game class interface:

I need these functions:


playCard(playerId: string, cardIndex: number): 
returns: { success: boolean; error?: string };



And:

drawCard(playerId: string)
returns: { success: boolean; error?: string };




Optional, but good to have:

selectWildColor(playerId: string, color: string)
returns: { success: boolean; error?: string };

