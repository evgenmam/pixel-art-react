export function generatePixelDrawCss(pixelGrid, columns, rows, cellSize) {
  const cssString = pixelGrid.reduce((accumulator, currentValue, i) => {
    if (currentValue.used) {
      const xCoord = ((i % columns) * cellSize) + cellSize;
      const yCoord = (parseInt(i / columns, 10) * cellSize) + cellSize;

      return `${accumulator} ${xCoord}px ${yCoord}px 0 #${currentValue.color},`;
    }

    return accumulator;
  }, '');
  return cssString.slice(0, -1);
}

/*
 * Return CSS keyframes data for animation of the frames passed
 *
 * The resultant data will look like:
 * {
 *   0%, 25%: { box-shadow: ...}
 *   25.01%, 50%: { box-shadow: ...}
 *   50.01%, 75%: { box-shadow: ...}
 *   75.01%, 100%: { box-shadow: ...}
 * }
 *
 * for intervalData like: [0, 25, 50, 75, 100]
*/
export function generateAnimationCSSData(frames, intervalData, columns, rows, cellSize) {
  const result = frames.reduce((acc, frame, index) => {
    const intervalAcc = acc;
    const currentBoxShadow = generatePixelDrawCss(frame, columns, rows, cellSize);
    const minValue = index === 0 ? 0 : intervalData[index] + 0.01;
    const maxValue = intervalData[index + 1];
    intervalAcc[`${minValue}%, ${maxValue}%`] =
    { boxShadow:
        `${currentBoxShadow};height: ${cellSize}px; width: ${cellSize}px;`
    };

    return intervalAcc;
  }, {});

  return result;
}

export function shareDrawing(imageData, text, type) {
  const cssParsedData = imageData.css.split(',').filter(
      (elem) => {
        return elem !== '';
      }).map(
        (elem) => {
          if (elem !== '') {
            return elem.trim().split(' ').reduce(
              (acum, item) => {
                acum.push(item.split('px').shift());
                return acum;
              },
            []);
          }
          throw new Error('Error parsing CSS data');
        }
      );

  const css = {
    cols: imageData.columns,
    rows: imageData.rows,
    pixelSize: imageData.cellSize,
    boxShadow: JSON.stringify(cssParsedData),
    text
  };

  switch (type) {
    case 'download':
      $.ajax({
        method: 'POST',
        url: '/auth/download',
        data: css
      }).done((data) => {
        window.open(data);
      });
      break;
    case 'twitter':
      $.ajax({
        method: 'POST',
        url: '/auth/twitter',
        data: css
      }).done((data) => {
        window.location = data;
      });
      break;
    default:
  }
}
