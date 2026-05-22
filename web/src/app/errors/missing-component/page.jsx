import * as helpers from './helpers';

export default function Page() {
  const Widget =
    helpers.DoesNotExist ??
    helpers.SomethingElse ??
    (() => 'Widget Not Found');

  return (
    <div>
      {Widget()}
    </div>
  );
}
