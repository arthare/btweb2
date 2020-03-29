export default function setupContextWithTheseCoords(
  canvas:HTMLCanvasElement, 
  ctx:CanvasRenderingContext2D, 
  left:number, 
  top:number, 
  right:number, 
  bottom:number
) {
  // this sets up a context so that drawing from (left, top) to (right, bottom) draws a diagonal line from visual top left to visual bottom right

  let temp = top;
  top = bottom;
  bottom = temp;

  const averageAltitude = (bottom + top) / 2;
  const spanHeight = bottom - top;
  const spanWidth = right - left;

  ctx.resetTransform();
  ctx.scale(canvas.width, canvas.height); // makes our scale 0..1,0..1
  ctx.scale(1 / spanWidth, 1 / spanHeight); // makes our scale 0..span,0..1
  ctx.scale(1,-1); // flips shit
  ctx.translate(-left, -(averageAltitude) - spanHeight/2);

}