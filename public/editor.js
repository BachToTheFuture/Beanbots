/*
editor.js
====================================
This handles the code editor
*/

/*
var editor = ace.edit( "editor" );

// inline must be true to syntax highlight PHP without opening <?php tag
editor.getSession().setMode( { path: "ace/mode/javascript" } );
editor.setFontSize("14px");
*/

Blockly.HSV_VALUE = 0.7 // 0 (inclusive) to 1 (exclusive), defaulting to 0.65

Blockly.Blocks['normalwheels_move'] = {
  init: function() {
    this.appendValueInput("velocity")
        .setCheck(null)
        .appendField("Move at power");
    this.appendValueInput("time")
        .setCheck(null)
        .appendField("for");
    this.appendDummyInput()
        .appendField("miliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['mecanumwheels_move'] = {
  init: function() {
    this.appendValueInput("xvel")
        .setCheck(null)
        .appendField("Move with");
    this.appendValueInput("yvel")
        .setCheck(null)
        .appendField("vx,");
    this.appendValueInput("time")
        .setCheck(null)
        .appendField("vy for");
    this.appendDummyInput()
        .appendField("miliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['wait'] = {
  init: function() {
    this.appendValueInput("time")
        .setCheck(null)
        .appendField("Wait");
    this.appendDummyInput()
        .appendField("miliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['wheels_rotate'] = {
  init: function() {
    this.appendValueInput("velocity")
        .setCheck(null)
        .appendField("Rotate with velocity");
    this.appendValueInput("time")
        .setCheck(null)
        .appendField(" for");
    this.appendDummyInput()
        .appendField("miliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['wheels_rotate'] = function(block) {
  var number_velocity = Blockly.JavaScript.valueToCode(block, 'velocity', Blockly.JavaScript.ORDER_ADDITION) || '0'
  var number_time = Blockly.JavaScript.valueToCode(block, 'time', Blockly.JavaScript.ORDER_ADDITION) || '0';
  // TODO: Assemble JavaScript into code variable.
  var code = `robot.wheels.rotate(${number_velocity});\nawait robot.wait(${number_time});`;
  return code;
};

Blockly.JavaScript['normalwheels_move'] = function(block) {
  var number_velocity = Blockly.JavaScript.valueToCode(block, 'velocity', Blockly.JavaScript.ORDER_ADDITION) || '0'
  var number_time = Blockly.JavaScript.valueToCode(block, 'time', Blockly.JavaScript.ORDER_ADDITION) || '0';
  // TODO: Assemble JavaScript into code variable.
  var code = `robot.wheels.move(${number_velocity});\nawait robot.wait(${number_time});`;
  return code;
};

Blockly.JavaScript['mecanumwheels_move'] = function(block) {
  var number_xvel = Blockly.JavaScript.valueToCode(block, 'xvel', Blockly.JavaScript.ORDER_ADDITION) || '0'
  var number_yvel = Blockly.JavaScript.valueToCode(block, 'yvel', Blockly.JavaScript.ORDER_ADDITION) || '0'
  var number_time = Blockly.JavaScript.valueToCode(block, 'time', Blockly.JavaScript.ORDER_ADDITION) || '0';
  // TODO: Assemble JavaScript into code variable.
  var code = `robot.wheels.move(${number_xvel}, ${number_yvel});\nawait robot.wait(${number_time});`;
  return code;
};

Blockly.JavaScript['wait'] = function(block) {
  var number_time = Blockly.JavaScript.valueToCode(block, 'time', Blockly.JavaScript.ORDER_ADDITION) || '0';
  // TODO: Assemble JavaScript into code variable.
  var code = `await robot.wait(${number_time})`;
  return code;
};

var options = { 
	toolbox : document.getElementById('toolbox'), 
	collapse : true, 
	comments : true, 
	disable : true, 
	maxBlocks : Infinity, 
	trashcan : false, 
	horizontalLayout : false, 
	toolboxPosition : 'start', 
	css : true, 
	media : 'https://blockly-demo.appspot.com/static/media/', 
	rtl : false, 
	scrollbars : false, 
	sounds : true, 
	oneBasedIndex : true
};

var workspace = Blockly.inject('blocklyDiv',options);
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