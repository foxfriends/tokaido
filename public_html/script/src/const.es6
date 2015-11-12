'use strict';

export const TC_WH_RATIO = 1.34;
export const CARD_WH_RATIO = 1.5368;
export const TITLE_COLOR = '#778574';
export const BOARD_WIDTH = 3779;
export const BOARD_HEIGHT = 1100;
export const SCOREBOARD_HEIGHT = 96;
export const SCOREBOARD_WIDTH = 2327;
export const SCOREBOARD_SPACE_WIDTH = (SCOREBOARD_WIDTH - 7) / 51;
export const SCOREBOARD_SPACE_HEIGHT = 42;
export const TC_WIDTH = 350;
export const TC_HEIGHT = 469;

export const CARD_WIDTH = 300;
export const CARD_HEIGHT = 461;

export const PILE_WIDTH = 200;
export const PILE_HEIGHT = PILE_WIDTH * CARD_WH_RATIO;

export const SOUVENIR_PILE_X = 1276 + PILE_WIDTH / 2;
export const SPRINGS_PILE_X = 1543 + PILE_WIDTH / 2;
export const ENCOUNTER_PILE_X = 1811 + PILE_WIDTH / 2;
export const MEAL_PILE_X = 2076 + PILE_WIDTH / 2;
export const MEALSET_PILE_X = 2297 + PILE_WIDTH / 2;

export const PADDY_PILE_X = 2979 + PILE_WIDTH / 2;
export const MOUNTAIN_PILE_X = 3245 + PILE_WIDTH / 2;
export const SEA_PILE_X = 3513 + PILE_WIDTH / 2;

export const PILE_Y = 50 + PILE_HEIGHT / 2;
export const PANO_PILE_Y = 700 + PILE_HEIGHT / 2;

export const JOIN = 0;
export const SETUP = 1;
export const PLAY = 2;
export const [SMALL_OBJECT, FOOD, CLOTHING, ART, LEGENDARY] = [1,2,3,4,5];