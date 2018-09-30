import { List, Map, fromJS } from 'immutable';
import paletteReducer from './paletteReducer';
import {
  init as initFrames,
  reset as resetFrame,
  clone as cloneFrame,
  add as addFrame,
  remove as removeFrame,
  changeDimensions as changeFrameDimensions,
  changeActive
} from './frames';
import {
  GRID_INITIAL_COLOR,
  applyBucket as applyBucketToGrid,
  drawPixel as drawPixelToGrid
} from './pixelGrid';
import drawingToolReducer from './drawingToolReducer';
import * as types from '../actions/actionTypes';

function setInitialState(state, action) {
  const cellSize = 10;
  const frames = initFrames(action.options);

  const initialState = {
    frames,
    cellSize,
    loading: false,
    notifications: List(),
    duration: 1
  };

  return state.merge(initialState);
}

function changeDimensions(state, { gridProperty, increment }) {
  return state.merge({
    frames: changeFrameDimensions(state.get('frames'), gridProperty, increment)
  });
}

function drawPixel(state, color, id) {
  const frames = state.get('frames');
  const newFrames = frames.updateIn(
    ['list', frames.get('activeIndex'), 'grid'],
    grid => drawPixelToGrid(grid, color, id)
  );
  return state.set('frames', newFrames);
}

function getCellColor({ color }) {
  return color || GRID_INITIAL_COLOR;
}

export function applyBucket(state, action) {
  const { id, paletteColor } = action;
  const cellColor = getCellColor(action);
  const {
    columns, rows, list, activeIndex
  } = state.get('frames').toObject();
  const activeGrid = list.getIn([activeIndex, 'grid']);

  const newGrid = applyBucketToGrid(activeGrid, {
    id, paletteColor, cellColor, columns, rows
  });

  return state.setIn(['frames', 'list', activeIndex, 'grid'], newGrid);
}

function drawCell(state, action) {
  const { id } = action;
  const drawingTool = state.get('drawingTool');
  let color = '';

  if (drawingTool === 'EYEDROPPER') {
    return state;
  } else if (drawingTool === 'BUCKET') {
    return applyBucket(state, action);
  }
  // regular cell paint
  if (drawingTool !== 'ERASER') {
    color = action.paletteColor;
  }
  return drawPixel(state, color, id);
}

function setDrawing(state, action) {
  const {
    frames, cellSize, columns, rows
  } = action;
  return state.merge({
    frames: fromJS({
      list: frames,
      columns,
      rows,
      activeIndex: 0
    }),
    cellSize
  });
}

function setCellSize(state, cellSize) {
  return state.merge({ cellSize });
}

function resetGrid(state) {
  return state.merge({
    frames: resetFrame(state.get('frames'))
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
    notifications: message === '' ? List() : List([{ message, id: 0 }])
  });
}

function changeActiveFrame(state, frameIndex) {
  return state.update('frames', frames => changeActive(frames, frameIndex));
}

function createNewFrame(state) {
  return state.update('frames', addFrame);
}

function deleteFrame(state, frameId) {
  return state.update('frames', frames => removeFrame(frames, frameId));
}

function duplicateFrame(state, frameId) {
  return state.update('frames', frames => cloneFrame(frames, frameId));
}

function setDuration(state, duration) {
  return state.merge({ duration });
}

function changeFrameInterval(state, frameIndex, interval) {
  return state.merge({
    frames: state.get('frames').updateIn(
      ['list', frameIndex, 'interval'],
      () => interval
    )
  });
}

function updateGridBoundaries(state, action) {
  const {
    x, y, width, height
  } = action.gridElement.getBoundingClientRect();
  return state.set('gridBoundaries', {
    x, y, width, height
  });
}

function partialReducer(state, action) {
  switch (action.type) {
    case types.SET_INITIAL_STATE:
      return setInitialState(state, action);
    case types.CHANGE_DIMENSIONS:
      return changeDimensions(state, action);
    case types.DRAW_CELL:
      return drawCell(state, action);
    case types.SET_DRAWING:
      return setDrawing(state, action);
    case types.SET_CELL_SIZE:
      return setCellSize(state, action.cellSize);
    case types.SET_RESET_GRID:
      return resetGrid(state);
    case types.SHOW_SPINNER:
      return showSpinner(state);
    case types.HIDE_SPINNER:
      return hideSpinner(state);
    case types.SEND_NOTIFICATION:
      return sendNotification(state, action.message);
    case types.CHANGE_ACTIVE_FRAME:
      return changeActiveFrame(state, action.frameIndex);
    case types.CREATE_NEW_FRAME:
      return createNewFrame(state);
    case types.DELETE_FRAME:
      return deleteFrame(state, action.frameId);
    case types.DUPLICATE_FRAME:
      return duplicateFrame(state, action.frameId);
    case types.SET_DURATION:
      return setDuration(state, action.duration);
    case types.CHANGE_FRAME_INTERVAL:
      return changeFrameInterval(state, action.frameIndex, action.interval);
    case types.NEW_PROJECT:
      return setInitialState(state, action);
    case types.UPDATE_GRID_BOUNDARIES:
      return updateGridBoundaries(state, action);
    default:
  }
  return state;
}

export default function (state = Map(), action) {
  return partialReducer(state, action).merge({
    drawingTool: drawingToolReducer(state.get('drawingTool'), action),
    palette: paletteReducer(state.get('palette'), action)
  });
}
