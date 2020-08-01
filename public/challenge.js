
/* Make it easier to create different challenges! */

class Challenge {
  constructor(name, description="", rules="") {
    this.name = name;
    this.desc = description;
    this.rules = rules;
    this.objects = [];
    
    // Where the robot will start
    this.robotInitPos = {blue: {x: 40, y: height/2}, red: {x: width-40, y: height/2}};
    
    this.pointBoundaries = []
    
    this.bluePoints = 0;
    this.redPoints = 0;

  }
  // this can be replaced
  collisionStart(bodyA, bodyB) {}
  
  
  initializeGame() {
    
  }
  
  
  resetPoints() {
    this.bluePoints = 0;
    this.redPoints = 0;
  }
  setupField() {
    
    // set the challenge stuff
    $("#challenge-name").html(this.name);
    $("#challenge-desc").html(this.desc);
    $("#challenge-rules").html(this.rules);
    // Create boundaries and walls
    topWall = Bodies.rectangle(width/2, -5, width, 10, { isStatic: true});
    rightWall = Bodies.rectangle(width+5, height/2, 10, height, { isStatic: true});
    leftWall = Bodies.rectangle(-5, height/2, 5, height, { isStatic: true});
    bottomWall = Bodies.rectangle(width/2, height+5, width, 10, { isStatic: true});
    World.add(world, [topWall, leftWall, rightWall, bottomWall]);
    
    // Add point boundaries where players can score points
    this.pointBoundaries.forEach(p => {
      let bounds = Bodies.rectangle(p.boundary[0], p.boundary[1],p.boundary[2],p.boundary[3]);
      bounds.isSensor = true;
      bounds.isStatic = true;
      bounds.role = p.type;
      bounds.points = p.points;
      bounds.to = p.to;
      bounds.endure = p.endure; // Remove points if the block goes outside the point boundary
      World.add(world, bounds);
    })

    // Add foundation?
    //objects.push(new Box(width/2-50, 70, 55, 100, color(219, 91, 87), "bluefoundation"));
    //objects.push(new Box(width/2+50, 70, 55, 100, color(0, 91, 87),"redfoundation"));
    
    // Awarding scores
    Events.on(engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      for (var i = 0, j = pairs.length; i != j; ++i) {
          var pair = pairs[i];
          challenge.collisionStart(pair.bodyA, pair.bodyB);
      };
    })
    
  }
  renderField() {}
  endGame() {
    /*
    Function used for cleaning up and resetting values after a game ends.
    */
    robot.textColor = "black";
    if (opponent) World.remove(world, opponent.body);
    socket = null;
    opponent = null;
    room = null;
    team = null;
    
    this.resetPoints();

    $(".runRobot").fadeIn();
    $("#join-match").text("Play a match!");
    $("#join-match").fadeIn();
    $(".competition-bar").hide();
    $(".practice-bar").fadeIn();
    robot.reset();
    this.objects.forEach(o => o.reset());
  }
}

function deliveryChallenge() {
  // Set descriptions
  let challenge = new Challenge("The Delivery Bot Challenge",
            `Create a bot that pushes as much blocks as it can across to the other side of the
              field in 15 seconds, but make sure to get them across your team lines. Be
              careful though, because other robots might get in your way!`,
            `Yellow blocks are worth <code>10 points</code> each, and black
              blocks are worth <code>20 points</code> each.`);
  
  // Add blocks
  for (var i = 0; i < 8; i++) {
    challenge.objects.push(new Box(width/2-114, height/2+100+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black", "stone"));
  }
  for (var i = 0; i < 8; i++) {
    challenge.objects.push(new Box(width/2+114, height/2+100+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black", "stone"));
  }
  // Set point boundaries
  challenge.pointBoundaries = [
    {boundary:[100, 305, 200, 10], points: 10, to: "blue", type: "line", endure: false},
    {boundary:[500, 305, 200, 10], points: 10, to: "red", type: "line", endure: false},
  ];
  // Set what happens when blocks hit
  challenge.collisionStart = (bodyA, bodyB) => {
      //if (pair.bodyA.role === "line" || pair.bodyB.role === "line") console.log(pair);
      if (bodyA.role === "line" && bodyB.role === "stone" && bodyB.pointMultiplier > 0) {
        let points = bodyA.points;
        if (bodyB.color == "black") points *= 2;
        if (bodyA.to == "blue") challenge.bluePoints += points * bodyB.pointMultiplier;
        else challenge.redPoints += bodyA.points * bodyB.pointMultiplier;
        console.log("Blue vs red:",challenge.bluePoints, challenge.redPoints);
        bodyB.pointMultiplier--;
      }
      else if (bodyB.role === "line" && bodyA.role === "stone" && bodyA.pointMultiplier > 0) {
        let points = bodyB.points;
        if (bodyA.color == "black") points *= 2;
        if (bodyB.to == "blue") challenge.bluePoints += points * bodyA.pointMultiplier;
        else challenge.redPoints += bodyB.points * bodyA.pointMultiplier;
        console.log("Blue vs red:",challenge.bluePoints, challenge.redPoints);
        bodyA.pointMultiplier--;
      }
  };
  // Render function
  challenge.renderField = ()=>{
    background(0,0,80);
    strokeWeight(0);
    // blue? bridge
    fill(219, 91, 87);
    rect(0, 300, 200, 10); 

    // red? bridge?
    fill(0,91, 87);
    rect(400, 300, 200, 10);

    // big bridge
    fill(0, 0, 70);
    rect(200, height/2-45, 200, 100);

    //how to get the yellow line to show above black 
    fill(65, 85, 100);
    rect(200, 300, 200, 10);

    strokeWeight(2);
  }
  return challenge;
}

function collectChallenge() {
  // Set descriptions
  let challenge = new Challenge("The Random Challenge",
            `Create a bot that pushes as much blocks as it can across to the other side of the
              field in 15 seconds, but make sure to get them across your team lines. Be
              careful though, because other robots might get in your way!`,
            `Yellow blocks are worth <code>10 points</code> each, and black
              blocks are worth <code>20 points</code> each.`);
  
  // Add blocks
  for (var i = 0; i < 25; i++) {
    challenge.objects.push(new Box(random(width/2-40,width/2+40), random(height/2-40,height/2+40), 16, 16, Math.random() > 0.3 ? "yellow" : "black", "stone"));
  }
  // Set point boundaries
  challenge.pointBoundaries = [
    {boundary:[100, 305, 200, 10], points: 10, to: "blue", type: "line", endure: false},
    {boundary:[500, 305, 200, 10], points: 10, to: "red", type: "line", endure: false},
  ];
  // Set what happens when blocks hit
  challenge.collisionStart = (bodyA, bodyB) => {
      //if (pair.bodyA.role === "line" || pair.bodyB.role === "line") console.log(pair);
      if (bodyA.role === "line" && bodyB.role === "stone" && bodyB.pointMultiplier > 0) {
        let points = bodyA.points;
        if (bodyB.color == "black") points *= 2;
        if (bodyA.to == "blue") challenge.bluePoints += points * bodyB.pointMultiplier;
        else challenge.redPoints += bodyA.points * bodyB.pointMultiplier;
        console.log("Blue vs red:",challenge.bluePoints, challenge.redPoints);
        bodyB.pointMultiplier--;
      }
      else if (bodyB.role === "line" && bodyA.role === "stone" && bodyA.pointMultiplier > 0) {
        let points = bodyB.points;
        if (bodyA.color == "black") points *= 2;
        if (bodyB.to == "blue") challenge.bluePoints += points * bodyA.pointMultiplier;
        else challenge.redPoints += bodyB.points * bodyA.pointMultiplier;
        console.log("Blue vs red:",challenge.bluePoints, challenge.redPoints);
        bodyA.pointMultiplier--;
      }
  };
  // Render function
  challenge.renderField = ()=>{
    background(0,0,80);
    strokeWeight(0);
    
    strokeWeight(2);
  }
  return challenge;
}