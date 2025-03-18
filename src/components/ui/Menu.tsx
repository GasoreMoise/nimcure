'use client';

import { Fragment } from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';

const MenuComponent = {
  Item: HeadlessMenu.Item,
  Items: HeadlessMenu.Items,
  Button: HeadlessMenu.Button,
  Root: HeadlessMenu
};

export { MenuComponent as Menu }; 