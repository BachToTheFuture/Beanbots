var editor = ace.edit( "editor" );

// inline must be true to syntax highlight PHP without opening <?php tag
editor.getSession().setMode( { path: "ace/mode/javascript" } );

/*
Some example code:
Program to find the first block or ball it sees and get its color

// Rotate until the distance sensor finds an object 
robot.wheels.rotate(0.01);
await robot.parts.distanceSensor.until(
    // This is the condition: robot rotates until distance is not 0.
    distance=>distance!=0,
    // This is a callback function to handle a distance
    // input every 1/4 of a second
    d=>{robot.name = "distance:" + Math.round(d);});
robot.wheels.stop();

// Move towards the object
robot.wheels.move(0.7);
await robot.parts.distanceSensor.until(
    distance=>distance<50,
    d=>{robot.name = "distance:" + Math.round(d)});
robot.wheels.stop();

// Rotate the robot so that the color sensor can pick up the color
robot.wheels.rotate(-0.1);
await robot.parts.colorSensor.until(color=>color!="gray");
robot.wheels.stop();
robot.name = "Detected color:" + robot.parts.colorSensor.color;
*/