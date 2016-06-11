import { List, Map } from 'immutable';
import {
  createGrid, createPalette, resetIntervals,
  checkColorInPalette, addColorToLastCellInPalette
} from './reducerHelpers';

const GRID_INITIAL_COLOR = '#313131';

function setInitialState(state) {
  const cellSize = 10;
  const columns = 20;
  const rows = 20;
  const currentColor = '#000000';
  const frame = createGrid(columns * rows, GRID_INITIAL_COLOR, 0);
  const paletteGrid = createPalette();
  const dragging = false;

  const initialState = {
    frames: [frame],
    paletteGridData: paletteGrid,
    cellSize,
    columns,
    rows,
    currentColor,
    initialColor: GRID_INITIAL_COLOR,
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false,
    loading: false,
    notifications: List(),
    dragging,
    activeFrameIndex: 0,
    duration: 1
  };

  return state.merge(initialState);
}

function setGridDimension(state, columns, rows) {
  const framesCount = state.get('frames').size;
  let newFrames = List();

  for (let i = 0; i < framesCount; i++) {
    newFrames = newFrames.push(createGrid(
      parseInt(columns, 10) * parseInt(rows, 10),
      GRID_INITIAL_COLOR,
      0
    ));
  }

  return state.merge({
    frames: resetIntervals(newFrames),
    rows: parseInt(rows, 10),
    columns: parseInt(columns, 10)
  });
}

function startDrag(state) {
  return state.merge({ dragging: true });
}

function endDrag(state) {
  return state.merge({ dragging: false });
}

function setColorSelected(state, newColorSelected) {
  const newState = {
    currentColor: newColorSelected,
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: false
  };
  const paletteGridData = state.get('paletteGridData');

  if (!checkColorInPalette(paletteGridData, newColorSelected)) {
    // If there is no newColorSelected in the palette it will create one
    newState.paletteGridData = addColorToLastCellInPalette(
      paletteGridData, newColorSelected
    );
  }

  return state.merge(newState);
}

function setCustomColor(state, customColor) {
  const currentColor = state.get('currentColor');
  const paletteGridData = state.get('paletteGridData');
  const newState = { currentColor: customColor };

  if (!checkColorInPalette(paletteGridData, currentColor)) {
    // If there is no colorSelected in the palette it will create one
    newState.paletteGridData = addColorToLastCellInPalette(
      paletteGridData, customColor
    );
  } else {
    newState.paletteGridData = paletteGridData.map((paletteColor) => {
      if (paletteColor.get('color') === currentColor) {
        return Map({ color: customColor });
      }
      return paletteColor;
    });
  }

  return state.merge(newState);
}

function setGridCellValue(state, color, used, id) {
  return state.setIn(
    ['frames', state.get('activeFrameIndex'), 'grid', id],
    Map({ color, used })
  );
}

function setDrawing(state, frames, paletteGridData, cellSize, columns, rows) {
  return state.merge({
    frames,
    paletteGridData,
    cellSize,
    columns,
    rows,
    activeFrameIndex: 0
  });
}

function setEraser(state) {
  return state.merge({
    currentColor: null,
    eraserOn: true,
    eyedropperOn: false,
    colorPickerOn: false
  });
}

function setEyedropper(state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: true,
    colorPickerOn: false
  });
}

function setColorPicker(state) {
  return state.merge({
    eraserOn: false,
    eyedropperOn: false,
    colorPickerOn: true
  });
}

function setCellSize(state, cellSize) {
  return state.merge({ cellSize });
}

function resetGrid(state, columns, rows, activeFrameIndex) {
  const currentInterval = state.get('frames').get(activeFrameIndex).get('interval');
  const newGrid = createGrid(
    parseInt(columns, 10) * parseInt(rows, 10),
    GRID_INITIAL_COLOR,
    currentInterval
  );

  return state.merge({
    frames: state.get('frames').update(activeFrameIndex, () => newGrid)
  });
}

function showSpinner(state) {
  return state.merge({ loading: true });
}

function hideSpinner(state) {
  return state.merge({ loading: false });
}

function sendNotification(state, message) {
  return state.merge({
    notifications: message === '' ? List() : List([message])
  });
}

function changeActiveFrame(state, frameIndex) {
  return state.merge({ activeFrameIndex: frameIndex });
}

function createNewFrame(state) {
  const newFrames = state.get('frames').push(createGrid(
    parseInt(state.get('columns'), 10) * parseInt(state.get('rows'), 10),
    GRID_INITIAL_COLOR,
    100
  ));
  return state.merge({
    frames: resetIntervals(newFrames),
    activeFrameIndex: newFrames.size - 1
  });
}

function deleteFrame(state, frameId) {
  const activeFrameIndex = state.get('activeFrameIndex');
  const newState = {};
  let frames = state.get('frames');

  if (frames.size > 1) {
    const reduceFrameIndex =
      (activeFrameIndex >= frameId) &&
      (activeFrameIndex > 0);

    frames = frames.splice(frameId, 1);
    newState.frames = resetIntervals(frames);

    if (reduceFrameIndex) {
      newState.activeFrameIndex = frames.size - 1;
    }
  }
  return state.merge(newState);
}

function duplicateFrame(state, frameId) {
  const frames = state.get('frames');
  return state.merge({
    frames: resetIntervals(frames.splice(frameId, 0, frames.get(frameId))),
    activeFrameIndex: frameId + 1
  });
}

function setDuration(state, duration) {
  return state.merge({ duration });
}

export default function (state = Map(), action) {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return setInitialState(state);
    case 'SET_GRID_DIMENSION':
      return setGridDimension(state, action.columns, action.rows);
    case 'SET_COLOR_SELECTED':
      return setColorSelected(state, action.newColorSelected);
    case 'SET_CUSTOM_COLOR':
      return setCustomColor(state, action.customColor);
    case 'SET_GRID_CELL_VALUE':
      return setGridCellValue(state, action.color, action.used, action.id);
    case 'SET_DRAWING':
      return setDrawing(
        state, action.frames, action.paletteGridData,
        action.cellSize, action.columns, action.rows);
    case 'START_DRAG':
      return startDrag(state);
    case 'END_DRAG':
      return endDrag(state);
    case 'SET_ERASER':
      return setEraser(state);
    case 'SET_EYEDROPPER':
      return setEyedropper(state);
    case 'SET_COLOR_PICKER':
      return setColorPicker(state);
    case 'SET_CELL_SIZE':
      return setCellSize(state, action.cellSize);
    case 'SET_RESET_GRID':
      return resetGrid(
        state, action.columns, action.rows,
        action.activeFrameIndex);
    case 'SHOW_SPINNER':
      return showSpinner(state);
    case 'HIDE_SPINNER':
      return hideSpinner(state);
    case 'SEND_NOTIFICATION':
      return sendNotification(state, action.message);
    case 'CHANGE_ACTIVE_FRAME':
      return changeActiveFrame(state, action.frameIndex);
    case 'CREATE_NEW_FRAME':
      return createNewFrame(state);
    case 'DELETE_FRAME':
      return deleteFrame(state, action.frameId);
    case 'DUPLICATE_FRAME':
      return duplicateFrame(state, action.frameId);
    case 'SET_DURATION':
      return setDuration(state, action.duration);
    default:
  }
  return state;
}
