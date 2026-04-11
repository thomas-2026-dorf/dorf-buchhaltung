import BelegeTab from "./BelegeTab";

type Props = React.ComponentProps<typeof BelegeTab>;

export default function BelegeTabWrapper(props: Props) {
  return <BelegeTab {...props} />;
}
