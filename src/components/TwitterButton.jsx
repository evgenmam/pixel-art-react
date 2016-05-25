import React from 'react';
import { connect } from 'react-redux';
import { shareDrawing } from '../utils/helpers';
import * as actionCreators from '../action_creators';

export class TwitterButton extends React.Component {
  constructor(props) {
    super(props);
    const initialText = 'made with http://goo.gl/73F1JR by @sprawlWalker #pixelart';
    this.state = {
      charsLeft: props.maxChars - initialText.length,
      initialText
    };
  }

  handleTextChange(event) {
    const input = event.target.value;
    this.setState({ charsLeft: this.props.maxChars - input.length });
  }

  tweetDrawing(type) {
    if (this.state.charsLeft >= 0) {
      const {
        frames, activeFrame, paletteGridData,
        columns, rows, cellSize, duration
      } = this.props;

      // Store current drawing in the web storage
      let dataStored = localStorage.getItem('pixel-art-react');
      const drawingToSave = {
        id: 0,
        frames: frames.toJS(),
        paletteGridData: paletteGridData.toJS(),
        cellSize,
        columns,
        rows
      };

      if (dataStored) {
        dataStored = JSON.parse(dataStored);
        dataStored.current = drawingToSave;
        localStorage.setItem('pixel-art-react', JSON.stringify(dataStored));
      }

      this.props.showSpinner();

      shareDrawing(
        {
          type,
          frames,
          activeFrame,
          columns,
          rows,
          cellSize,
          duration
        },
        this.refs.tweetText.value,
        'twitter'
      );
    }
  }

  render() {
    let countColor = '#000000';
    if (this.state.charsLeft < 0) {
      countColor = 'red';
    }
    const customStyles = {
      h2: {
        padding: '1em 0',
        fontSize: '1.5em',
        display: 'block',
        width: '80%',
        margin: '1em auto'
      },
      h3: {
        padding: '1em 0',
        fontSize: '1em',
        display: 'block',
        width: '80%',
        margin: '1em auto'
      },
      textarea: {
        width: '80%',
        resize: 'none',
        height: '6em'
      },
      charCount: {
        margin: '1em auto',
        color: countColor
      },
      button: {
        margin: '1em auto'
      },
      buttonWrapper: {
        margin: '0 auto',
        display: 'table'
      }
    };

    return (
      <div style={customStyles.buttonWrapper}>
        <h2 style={customStyles.h2}>
          You are about to share your awesome drawing on Twitter
        </h2>
        <textarea
          ref="tweetText"
          style={customStyles.textarea}
          onChange={(event) => { this.handleTextChange(event); }}
          defaultValue={this.state.initialText}
        >
        </textarea>
        <div style={customStyles.charCount} className="char-count">
          {this.state.charsLeft}
        </div>
        <h3 style={customStyles.h3}>
          Please customize your message above,
          the drawing will be automatically included
        </h3>
        <button
          style={customStyles.button}
          onClick={() => { this.tweetDrawing(this.props.tweetType); }}
        >
          <span className="fa fa-twitter"></span>TWEET
        </button>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}
export const TwitterButtonContainer = connect(
  mapStateToProps,
  actionCreators
)(TwitterButton);
