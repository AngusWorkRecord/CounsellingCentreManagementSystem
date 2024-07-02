import { useState } from "react";
import PropTypes from 'prop-types';
import { Button, Card, Stack, Chip } from "@mui/material";
import { Draggable } from '@hello-pangea/dnd';
import './drag-and-drop-button.css';

DraggableButtons.propTypes = {
  buttonData: PropTypes.array,
};

export function DraggableButtons({ buttonData }) {
  const onstart = (args) => {

    // args.dataTransfer.setData("text", `<div><img src="${Chip.avatar}" alt="${Chip.label}"/>${Chip.label}</div>`);
    // args.dataTransfer.setData("application/x-button", args.target.outerHTML);
    // args.dataTransfer.setData("text/plain", args.target.outerHTML);
    // args.dataTransfer.dropEffect = 'move';

    const button = args.currentTarget;
    const data = button.outerHTML;
    // console.log("ada", data)
    args.dataTransfer.setData('text/html', data);
  }

  return (
    <>
      <div className="keywordTitle">
        Keyword Pool
      </div>
      {/* <div className="same-row"> */}
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        flexWrap="wrap"
      >
        {buttonData.map((el, index) =>
        (
          <button draggable="true" onDragStart={onstart} key={index} type="button">{el.PlaceholderDescription}</button>
          // <p draggable="true" onDragStart={onstart} key={index} className="chip-liked nudge">
          //   `( {el.PlaceholderDescription} )`
          // </p>
        )
        )}
      </Stack>
      {/* </div> */}
      <div className='disclaimer'>
        <p>The keyword pool on the top contain all the specific parameter for you to drag in the editor box. The keyword will tell the system to automatically assign dynamic value into the template.</p>
      </div>
    </>
  );
};


