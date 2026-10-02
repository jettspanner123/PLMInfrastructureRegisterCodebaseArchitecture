import React from 'react';
import CardSharedComponent from './CardSharedComponent';

export interface DataTableContainerSharedComponentProps {
  children: React.ReactNode;
}

// The app-wide edge-to-edge data table shell: a CardSharedComponent with its
// default padding stripped (forced via `!p-0` since Tailwind's cascade order
// can't be trusted to let a bare `p-0` beat the card's own `p-5`), wrapping a
// single container that scrolls both axes independently of the page. Both
// scroll axes have to live on the SAME element — overflow-x-auto alone
// forces overflow-y's computed value to 'auto' too (per the CSS overflow
// spec), which already makes this div the containing block for any sticky
// header inside it, so the bounded height here is what makes that sticking
// meaningful rather than giving the table a conflicting second scroll
// boundary.
export default function DataTableContainerSharedComponent({
  children,
}: DataTableContainerSharedComponentProps): React.JSX.Element {
  return (
    <CardSharedComponent className="!p-0 overflow-hidden">
      <div className="overflow-auto max-h-[calc(100vh-12rem)]">{children}</div>
    </CardSharedComponent>
  );
}
