import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

export const Box = ({ name, content, hooks: { changeData } }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { name, type: ItemTypes.BOX },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        changeData({ structureId: dropResult.name, dataId: item.name });
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0.4 : 1;
  return (
    <div ref={drag} className="box" style={{ opacity }}>
      {content}
    </div>
  );
};
