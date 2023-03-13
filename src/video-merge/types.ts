export type VideoConfig = {
  RESOLUTION: {
    WIDTH: number;
    HEIGHT: number;
  };
  FRAMERATE: number;
  TEMP_DIR: string;
  OUTPUT_DIR: string;

  /**
   * go to https://gl-transitions.com/gallery/ to see all available transitions
   */
  TRANSITION: {
    NAME: string;
    DURATION: number;
  };

  /**
   * Intro video path (optional)
   */
  INTRO_PATH: string;

  /**
   * Outro video path (optional)
   */
  OUTRO_PATH: string;
};
