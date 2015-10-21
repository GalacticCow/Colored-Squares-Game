# Colored-Squares-Game
A very short html5 demo game.

The purpose of this demo was to test my own Javascript/HTML skills by using HTML5's canvas to make a simple game.

It's not very playable right unless you have 4 people crawling over the same keyboard.  The intention was to make
it multiplayer over the internet, but I don't have the technical skill to make a multiplayer game at the moment, so
I'm saving that project expansion for later.


RULES:
  Each player controls one of the colored squares on the grid.  Use the appropriate key set (arrow keys, WASD,
  TFGH, and IJKL) to control that square and move it acros the grid.  As the square moves, it changes the color
  of the tile it is on to its own color.  You can turn white or other-colored tiles to your own color by moving
  across them like this.
  The exception is BOMB tiles, which are black-colored.  If you step on a bomb tile, all tiles of your color that
  are connected continuously to the bomb tile turn to white, and you gain points equivalent to how many of those
  tiles there were.  The bomb reappears in a random location on the board.
  As such, the goal of the game is to build up continuous blocks of your own color, and detonate the bomb to gain
  as many points as possible.  In turn, you must block your opponent's attempts to detonate the bomb, by cutting
  off their continuous tiles before they detonate the bomb, or simply by converting their color's tiles to your
  own color.
  Currently there is no win condition, and the points don't matter.  This should change in the future if I continue
  this project.
