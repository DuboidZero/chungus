import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useEscapeKey } from '../lib/useEscapeKey';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  useEscapeKey(onClose, isOpen);

  // Keep the modal mounted through its exit animation, then unmount.
  const [rendered, setRendered] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      setClosing(false);
      return;
    }
    setClosing(true);
    const t = setTimeout(() => setRendered(false), 160);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!rendered) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-inverse-surface/50 backdrop-blur-md ${closing ? 'modal-backdrop-out' : 'modal-backdrop'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`relative w-full ${maxWidthClass[maxWidth]} bg-surface-container-lowest rounded-xl shadow-[0_24px_64px_rgba(90,86,139,0.25)] border border-outline-variant/40 flex flex-col max-h-[90vh] overflow-hidden ${closing ? 'modal-panel-out' : 'modal-panel'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50">
          <h2 id="modal-title" className="text-lg font-semibold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="press p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Universal generic modal component used exclusively for delete confirmation flows. */
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  entityName: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, entityName }: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-6">
        <p className="text-sm text-on-surface-variant">
          Are you sure you want to delete <span className="font-semibold text-on-surface">{entityName}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="press px-4 py-2 rounded-md text-sm font-medium border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="press px-4 py-2 rounded-md text-sm font-medium bg-error hover:bg-error/90 text-on-primary shadow-sm hover:shadow-md transition-[color,background-color,box-shadow] duration-150"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
