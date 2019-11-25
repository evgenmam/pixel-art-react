import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Picker from 'react-color';
import { switchTool, setCustomColor } from '../store/actions/actionCreators';
import { COLOR_PICKER, PENCIL } from '../store/reducers/drawingToolStates';

const ColorPickerContainer = React.memo(() => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const colorPickerOn = useSelector(
    state => state.present.get('drawingTool') === COLOR_PICKER
  );
  const paletteColor = useSelector(state => {
    const palette = state.present.get('palette');
    const currentColorPosition = palette.get('position');
    return palette.getIn(['grid', currentColorPosition, 'color']);
  });

  const dispatch = useDispatch();
  const switchColorPickerAction = switchTool(COLOR_PICKER);
  const setPencilToolAction = switchTool(PENCIL);

  const isSelected = colorPickerOn && displayColorPicker;
  const initialPickerColor = paletteColor || '#ffffff';

  const handleClick = () => {
    const switchColorPicker = () => dispatch(switchColorPickerAction);
    switchColorPicker();
    if (!displayColorPicker) {
      setDisplayColorPicker(!displayColorPicker);
    }
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
    const setPencilTool = () => dispatch(setPencilToolAction);
    setPencilTool();
  };

  const onPickerChange = color => dispatch(setCustomColor(color.hex));

  // Necessary inline styles for react-color component
  const styles = {
    picker: {
      position: 'relative',
      bottom: '9em'
    },
    popover: {
      position: 'absolute',
      zIndex: '2',
      right: -250,
      top: 155
    },
    cover: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  };

  return (
    <div className="color-picker">
      <button
        type="button"
        aria-label="Color Picker Tool"
        className={`color-picker__button${isSelected ? ' selected' : ''}`}
        onClick={handleClick}
      />
      <div style={styles.picker}>
        {displayColorPicker ? (
          <div style={styles.popover} is="popover">
            <div
              style={styles.cover}
              is="cover"
              onClick={handleClose}
              role="presentation"
            />
            <Picker
              color={initialPickerColor}
              onChangeComplete={onPickerChange}
              onClose={handleClose}
              type="sketch"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default ColorPickerContainer;
