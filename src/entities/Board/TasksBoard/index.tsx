import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTypedSelector } from "../../../hooks";

import { useAuth } from "../../../useAuth";

import { Card } from "./Card";

import { Container, Grid, Column, ColumnTitle, HeadGrid } from "./styled";
import { ReactComponent as AddTaskIcon } from "../../../assets/AddTaskIcon.svg";
import { CreateCard } from "./CreateCard";

import { collection, setDoc, doc, orderBy, query } from "firebase/firestore";

import { useCollectionData } from "react-firebase-hooks/firestore";

export const TasksBoard = ({ currentProject }: { currentProject: any }) => {
  const [newTaskColumn, setNewTaskColumn] = useState<string | undefined>();

  const onClose = useCallback(() => {
    setNewTaskColumn(undefined);
  }, []);

  const onOpen = useCallback((columnTitle: string | undefined) => {
    setNewTaskColumn(columnTitle);
  }, []);

  const drugItem = useRef<{ groupIndex: number; itemIndex: number } | null>();
  const drugNode = useRef<any>();

  const { tasks } = useTypedSelector((state) => state.tasks);

  const { dataBase, user } = useAuth();

  const [list, setList] = useState<any[]>(tasks);

  const editTasks = useCallback(
    async (column: string) => {
      const documents = doc(
        dataBase,
        `users/${user.uid}/projects/${currentProject}/columns/${column}`
      );

      await setDoc(
        documents,
        list.find(({ title }) => title === column)
      );
    },
    [currentProject, dataBase, list, user.uid]
  );

  const queryData = useMemo(() => {
    const collectionRef = collection(
      dataBase,
      `users/${user.uid}/projects/${currentProject}/columns`
    );

    return query(collectionRef, orderBy("timestamp", "asc"));
  }, [currentProject, dataBase, user.uid]);

  const [docs, loading, error] = useCollectionData(queryData);

  useEffect(() => {
    docs?.length ? setList(docs) : setList([]);
  }, [docs]);

  const [dragging, setDragging] = useState(false);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    groupIndex: number,
    itemIndex: number
  ) => {
    drugItem.current = { groupIndex, itemIndex };
    drugNode.current = event.target;

    drugNode.current.addEventListener("dragend", () =>
      handleDragEnd(groupIndex)
    );

    setTimeout(setDragging, 0, true);
  };

  const handleDragEnd = async (groupIndex: number) => {
    setDragging(false);

    const currentItem = drugItem.current;

    if (groupIndex !== currentItem!.groupIndex) {
      editTasks(list[groupIndex].title);
      editTasks(list[currentItem!.groupIndex].title);
    }

    editTasks(list[groupIndex].title);

    drugNode.current.removeEventListener("dragend", handleDragEnd);

    drugItem.current = null;
    drugNode.current = null;

    if (!list.length) return;
  };

  const handleDragEnter = (
    event: React.DragEvent<HTMLDivElement>,
    groupIndex: number,
    itemIndex: number
  ) => {
    if (!dragging) return;

    const currentItem = drugItem.current;

    if (event.target !== drugNode.current) {
      setList((prevValue) => {
        const newList = [...prevValue];

        newList[groupIndex]?.tasks?.splice(
          itemIndex,
          0,
          newList[currentItem!.groupIndex]?.tasks?.splice(
            currentItem?.itemIndex,
            1
          )[0]
        );

        drugItem.current = { groupIndex, itemIndex };
        return newList;
      });
    }
  };

  return (
    <>
      <Container>
        <HeadGrid length={list?.length}>
          {list?.map((group: any) => (
            <ColumnTitle key={group.title}>{group.title}</ColumnTitle>
          ))}
        </HeadGrid>

        <Grid length={list?.length}>
          {list?.map((group: any, groupIndex) => (
            <Column
              key={group.title}
              onDragEnter={
                dragging && !group.tasks?.length
                  ? (event) => handleDragEnter(event, groupIndex, 0)
                  : undefined
              }
            >
              {group.tasks?.map((item: any, itemIndex: number) => (
                <Card
                  currentProject={currentProject}
                  key={item.id}
                  column={group.title}
                  handleDragEnter={(event: React.DragEvent<HTMLDivElement>) =>
                    handleDragEnter(event, groupIndex, itemIndex)
                  }
                  handleDragStart={(event: React.DragEvent<HTMLDivElement>) =>
                    handleDragStart(event, groupIndex, itemIndex)
                  }
                  isCurrent={
                    dragging &&
                    drugItem.current?.groupIndex === groupIndex &&
                    drugItem.current?.itemIndex === itemIndex
                  }
                  item={item}
                  groupIndex={0}
                  itemIndex={0}
                />
              ))}

              <CreateCard
                title={newTaskColumn}
                currentProject={currentProject}
                open={!!newTaskColumn}
                onClose={onClose}
              />

              <AddTaskIcon onClick={() => onOpen(group.title)} />
            </Column>
          ))}
        </Grid>
      </Container>
    </>
  );
};
