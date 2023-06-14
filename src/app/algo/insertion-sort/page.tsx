"use client";

import MarkedList from "@/app/components/MarkedList";
import { Button, Text, TextField } from "@adobe/react-spectrum";
import HistoryIcon from "@spectrum-icons/workflow/History";
import ChevronRightIcon from "@spectrum-icons/workflow/ChevronRight";
import PauseIcon from "@spectrum-icons/workflow/Pause";
import PlayIcon from "@spectrum-icons/workflow/Play";
import { useCallback, useEffect, useReducer, useRef } from "react";

function* algorithm(s: Array<string>): Generator<Snapshot, void, void> {
  for (let i = 1; i < s.length; i++) {
    let j = i;
    while (j > 0 && s[j] < s[j - 1]) {
      yield { i, j, s };
      s = s.slice();
      [s[j], s[j - 1]] = [s[j - 1], s[j]];
      j--;
    }
    yield { i, j, s };
  }
}

interface Snapshot {
  s: Array<string>;
  i: number;
  j: number;
}

interface State {
  status: "idle" | "playing" | "done";
  input: string;
  log?: Array<Snapshot>;
  step?: number;
}

type Action =
  | { type: "step" }
  | { type: "togglePlaying" }
  | { type: "reset"; payload: { input: string } }
  | { type: "revertTo"; payload: { step: number } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "step": {
      if (state.status === "done") {
        return state;
      }

      if (state.log == undefined) {
        const input = inputToList(state.input);
        const log = Array.from(algorithm(input));
        return { ...state, log, step: 0 };
      }

      const step = (state.step ?? 0) + 1;
      if (step >= state.log.length) {
        return { ...state, status: "done" };
      } else {
        return { ...state, step: (state.step ?? 0) + 1 };
      }
    }

    case "togglePlaying": {
      return { ...state, status: state.status === "idle" ? "playing" : "idle" };
    }

    case "reset": {
      return {
        ...state,
        status: "idle",
        input: action.payload.input,
        log: undefined,
        step: 0,
      };
    }

    case "revertTo": {
      const max = (state.log?.length ?? 0) - 1;
      const step = Math.max(0, Math.min(action.payload.step, max));
      const status = step < max ? "idle" : "done";
      return { ...state, status, step };
    }
  }
}

const inputToList = (input: string) => input.replace(/\s/g, "").split("");

const initialState: State = {
  status: "idle",
  input: "INSERTIONSORT",
};

export default function InsertionSortPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const logElem = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!logElem.current) return;
    const observer = new ResizeObserver((_entries) =>
      logElem.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" })
    );
    observer.observe(logElem.current);
    return () => observer.disconnect();
  }, []);

  const isPlaying = state.status === "playing";
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => dispatch({ type: "step" }), 250);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const isIdle = state.status === "idle";
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (isIdle && e.key === "ArrowRight") {
        dispatch({ type: "step" });
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [isIdle]);

  return (
    <div>
      <div className="sticky top-0 left-0 right-0 z-10 px-10 pt-6 pb-1 mb-10 shadow-sm bg-neutral-200">
        <div className="flex flex-row gap-8">
          <TextField
            value={state.input}
            onChange={(input) =>
              dispatch({ type: "reset", payload: { input } })
            }
            aria-label="List to sort"
            description={`${inputToList(state.input).length} characters`}
            flexGrow={1}
          />

          <div className="flex flex-row gap-4">
            <Button
              isDisabled={state.status !== "idle"}
              variant="accent"
              onPress={() => dispatch({ type: "step" })}
            >
              <Text>Step</Text>
              <ChevronRightIcon />
            </Button>

            <Button
              isDisabled={state.status === "done"}
              variant="secondary"
              onPress={() => dispatch({ type: "togglePlaying" })}
            >
              <Text>{state.status === "idle" ? "Play" : "Pause"}</Text>
              {state.status === "idle" ? <PlayIcon /> : <PauseIcon />}
            </Button>
          </div>
        </div>
      </div>

      <ol className="pb-20" ref={logElem}>
        {state.log
          ?.slice(0, (state.step ?? 0) + 1)
          .map(({ s: items, i, j }, step, log) => (
            <li key={step} className="flex items-center my-3 group">
              <span className="invisible mx-[0.5rem] group-hover:visible group-hover:animate-fade-in">
                <Button
                  variant="secondary"
                  onPress={() =>
                    dispatch({ type: "revertTo", payload: { step } })
                  }
                >
                  <HistoryIcon size="S" />
                </Button>
              </span>
              <span>
                <span className="mr-2 text-sm opacity-70">{step}</span>
                <MarkedList
                  items={items}
                  markers={[
                    [i, "i"],
                    [j, "j"],
                  ]}
                  compact={step < log.length - 1}
                />
                {step === log.length - 1 && state.status === "done" && (
                  <span className="px-2 py-1 ml-3 text-sm text-gray-800 bg-green-200 rounded">
                    DONE
                  </span>
                )}
              </span>
            </li>
          ))}
      </ol>
    </div>
  );
}
