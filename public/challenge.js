class Challenge {
  constructor(name, description="") {
    this.name = name;
    this.description = description;
    this.pointBoundaries = [
      {boundary:[100, 305, 200, 10], points: 10, to: "blue", type: "line"},
      {boundary:[500, 305, 200, 10], points: 10, to: "red", type: "line"},
    ];
    this.bluePoints = 0;
    this.redPoints = 0;
  }
  resetPoints() {
    this.bluePoints = 0;
    this.redPoints = 0;
  }
  setupField() {
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
      World.add(world, bounds);
    })

    // Add foundation?
    //objects.push(new Box(width/2-50, 70, 55, 100, color(219, 91, 87), "bluefoundation"));
    //objects.push(new Box(width/2+50, 70, 55, 100, color(0, 91, 87),"redfoundation"));

    for (var i = 0; i < 8; i++) {
      objects.push(new Box(width/2-114, height/2+100+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black", "stone"));
    }
    for (var i = 0; i < 8; i++) {
      objects.push(new Box(width/2+114, height/2+100+i*27, 14, 25, Math.random() > 0.3 ? "yellow" : "black", "stone"));
    }
    
  }
  renderField() {
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
    
    /*
    push();
    noFill();
    strokeWeight(4);
    stroke(0, 91, 87);
    square(-5, height-75, 80);
    pop();

    push();
    noFill();
    strokeWeight(4);
    stroke(219, 91, 87);
    square(width-75, height-75, 80);
    pop();
    */
    strokeWeight(2);
  }
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
    objects.forEach(o => o.reset());
  }
}