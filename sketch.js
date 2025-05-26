let video;
let facemesh;
let handpose;
let predictions = [];
let hands = [];
let circlePos = { x: 0, y: 0 };

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handReady);
  handpose.on('predict', results => {
    hands = results;
  });
}

function modelReady() {
  // FaceMesh模型載入完成
}

function handReady() {
  // Handpose模型載入完成
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 預設圓圈在鼻子
    let [x, y] = keypoints[1];

    // 根據手勢移動圓圈
    if (hands.length > 0) {
      const hand = hands[0];
      const fingerCount = countExtendedFingers(hand);

      if (fingerCount === 2) {
        // 剪刀：額頭（第10點）
        [x, y] = keypoints[10];
      } else if (fingerCount === 0) {
        // 石頭：左臉（第234點）
        [x, y] = keypoints[234];
      } else if (fingerCount === 5) {
        // 布：右眼（第263點）
        [x, y] = keypoints[263];
      }
    }

    // 畫圓圈
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 50, 50);
  }
}

// 計算伸出的手指數量
function countExtendedFingers(hand) {
  // hand.annotations.fingerName: [[x, y, z], ...]
  // 只簡單判斷每根手指末端與掌心的距離
  let count = 0;
  const palm = hand.annotations.palmBase[0];
  const fingers = ['thumb', 'indexFinger', 'middleFinger', 'ringFinger', 'pinky'];
  for (let finger of fingers) {
    const tip = hand.annotations[finger][3];
    const d = dist(palm[0], palm[1], tip[0], tip[1]);
    if (d > 60) count++; // 距離閾值可調整
  }
  return count;
}
