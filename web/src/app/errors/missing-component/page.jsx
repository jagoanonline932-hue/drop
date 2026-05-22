import * as helpers from './helpers';

export default function Page() {
  const Widget =
    helpers.DoesNotExist ??
    helpers.SomethingElse ??
    (() => <div>Widget Not Found</div>);

  return (
    <div>
      <Widget />
    </div>
  );
}
