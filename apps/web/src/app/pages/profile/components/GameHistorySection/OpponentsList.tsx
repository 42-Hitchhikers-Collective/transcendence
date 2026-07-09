'use client';

import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '@/shared/animate-ui/components/animate/avatar-group';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';


function getInitial(username: string) {
  return username && username.length > 0 ? username[0].toUpperCase() : '?';
}

export const OpponentsList = ({opponent} :{opponent: {
    id: string;
    username: string;
    avatar: string;
  }[]}) => {
  return (
    <AvatarGroup className="-space-x-3.5 min-[450px]:-space-x-5 lg:-space-x-3.5">
      {opponent.map((opponent, index) => (
        <Avatar key={index} className="size-[clamp(1.75rem,3.5vw,3.5rem)] min-[450px]:size-[clamp(2.5rem,5vw,4.5rem)] lg:size-[clamp(1.75rem,3.5vw,3.5rem)] border-3 border-background">
          <AvatarImage src={opponent.avatar}/>
          <AvatarFallback className="text-[clamp(0.65rem,1.2vw,1.2rem)] min-[450px]:text-[clamp(0.85rem,1.5vw,1.3rem)] lg:text-[clamp(0.65rem,1.2vw,1.2rem)]">{getInitial(opponent.username)}</AvatarFallback>
          <AvatarGroupTooltip className="text-xs sm:text-sm min-[450px]:text-base lg:text-sm px-3 sm:px-4 min-[450px]:px-5 lg:px-4 py-1.5 sm:py-2 min-[450px]:py-2.5 lg:py-2">
            {opponent.username}
          </AvatarGroupTooltip>
        </Avatar>
      ))}
    </AvatarGroup>
  );
};