import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon, } from 'lucide-react';
import { cn } from '@/lib/utils';
;
import { Button, buttonVariants } from '@/components/ui/button';
;

function Pagination({ className, ...props }) { return ( <nav role="navigation" aria-label="pagination" data-slot="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} /> ) }

function PaginationContent({ className, ...props }) { return ( <ul data-slot="pagination-content" className={cn('flex flex-row items-center gap-1', className)} {...props} /> ) }

function PaginationItem({ ...props }) { return <li data-slot="pagination-item" {...props} /> }
