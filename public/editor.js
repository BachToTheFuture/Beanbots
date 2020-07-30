/*
editor.js
====================================
This handles the code editor
*/

var editor = ace.edit( "editor" );

// inline must be true to syntax highlight PHP without opening <?php tag
editor.getSession().setMode( { path: "ace/mode/javascript" } );
editor.setFontSize("14px");

/*

// Type something!
// Rotate until the distance sensor finds an object 
robot.parts.distanceSensor.distance = 0;
robot.wheels.rotate(0.01);
await robot.parts.distanceSensor.until(
    // This is the condition: robot rotates until distance is not 0.
    distance=>distance!=0);
robot.wheels.stop();

// Move towards the object
robot.wheels.move(0.7);
await robot.parts.distanceSensor.until(
    distance=>distance<50);
robot.wheels.stop();
*/