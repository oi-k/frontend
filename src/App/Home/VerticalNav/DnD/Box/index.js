import React from "react";
import { useDrag } from "react-dnd";

import { findNode } from "../../../utils";

import db from "../../../../../db";

async function handleUpdate(
  { parent, data },
  { changeData, setShowDnDCallout, setUser }
) {
  // First find the data object with dataId
  let [dataType, dataId] = data.split("-");
  dataId = Number(dataId);
  // node -> nodes
  await db.nodes.update(dataId, { inTree: true });
  const item = await db.nodes.get(dataId);

  // update to inTree -> true
  // Then get the tree of current subject and update the tree with data
  const user = await db.user.toCollection().first();
  const tree = await db.trees.get({ subjectId: user.currentSubject });
  const structure = tree.structure;
  const node = findNode(parent, tree.structure, {}, false);
  node.childNodes.push({
    id: item.id,
    nodeId: data,
    type: dataType,
    childNodes: [],
  });
  // update tree
  await db.trees.update(tree.id, { structure });
  // update user if step needs to be updated
  if (user.step === 3) {
    await db.user.update(user.id, {
      // To next step, this only runs during first visit or if help is clicked
      step: 4,
    });
    const updatedUser = await db.user.get(user.id);
    setUser(updatedUser);
    setShowDnDCallout(false);
  }

  const nodes =
    (await db.nodes.where({ subjectId: user.currentSubject }).toArray()) || [];
  changeData({ update: "updateTreeAndData", structure, data: nodes });
}

export const Box = ({ name, content, hooks }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { name, type: "box" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        // I need to do api calls here so as not to do it in the useEffect
        // of the home component
        handleUpdate(
          {
            // problem with name being a zero
            parent: dropResult.name,
            data: item.name,
          },
          hooks
        );
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
