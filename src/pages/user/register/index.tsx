import * as React from "react";

interface PropsType {}

export default function ComponentName(props: PropsType) {
  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    // Update the document title using the browser API
  });
  return (
    <div>
      <h1>Hello, register!</h1>
    </div>
  );
}
