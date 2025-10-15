
import data from './data.json';

export type AgentImage = {
  url: string;
  color: string;
};

export const agentImages: AgentImage[] = data.characters.map(character => ({
  url: character.images.banner,
  color: character.theme.primary,
}));
