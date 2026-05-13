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

export const Players = ({opponent} :{opponent: {
    id: number;
    username: string;
    avatar: string;
  }[]}) => {
  return (
    <AvatarGroup>
      {opponent.map((opponent, index) => (
        <Avatar key={index} className="size-10 border-3 border-background">
          <AvatarImage src={opponent.avatar}/>
          <AvatarFallback>{getInitial(opponent.username)}</AvatarFallback>
          <AvatarGroupTooltip>{opponent.username}</AvatarGroupTooltip>
        </Avatar>
      ))}
    </AvatarGroup>
  );
};