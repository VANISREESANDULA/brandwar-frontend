import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useDragSelect
 * @param {Array} items - List of items with IDs
 * @param {Array} selectedIds - Currently selected IDs
 * @param {Function} setSelectedIds - State setter for selection
 * @param {string} itemClassName - CSS class used to identify selectable items
 */
export const useDragSelect = ({ items, selectedIds, setSelectedIds, itemClassName }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null);
    const startPos = useRef({ x: 0, y: 0 });
    const selectionMap = useRef(new Set());

    const onMouseDown = useCallback((e) => {
        // Only trigger on left click and not on child buttons/interactive elements
        if (e.button !== 0 || e.target.closest('button, a, input')) return;

        setIsDragging(true);
        startPos.current = { x: e.clientX, y: e.clientY };
        setSelectionBox({
            top: e.clientY,
            left: e.clientX,
            width: 0,
            height: 0,
        });

        // Initialize selection map with current selection if Shift is held, or empty
        if (e.shiftKey) {
            selectionMap.current = new Set(selectedIds);
        } else {
            selectionMap.current = new Set();
        }
    }, [selectedIds]);

    const onMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const currentX = e.clientX;
        const currentY = e.clientY;

        const left = Math.min(startPos.current.x, currentX);
        const top = Math.min(startPos.current.y, currentY);
        const width = Math.abs(startPos.current.x - currentX);
        const height = Math.abs(startPos.current.y - currentY);

        setSelectionBox({ top, left, width, height });

        // Detection logic
        const selectableElements = document.querySelectorAll(`.${itemClassName}`);
        const newSelection = new Set(selectionMap.current);

        selectableElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const id = el.getAttribute('data-id');

            const isOverlap = !(
                rect.right < left ||
                rect.left > left + width ||
                rect.bottom < top ||
                rect.top > top + height
            );

            if (isOverlap) {
                newSelection.add(id);
            } else if (!e.shiftKey && !selectionMap.current.has(id)) {
                // If not in original selection and not overlapping, remove (unless shift is held)
                newSelection.delete(id);
            }
        });

        setSelectedIds(Array.from(newSelection));
    }, [isDragging, itemClassName, setSelectedIds]);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
        setSelectionBox(null);
        selectionMap.current = new Set();
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', onMouseUp);
            return () => window.removeEventListener('mouseup', onMouseUp);
        }
    }, [isDragging, onMouseUp]);

    return {
        onMouseDown,
        onMouseMove,
        isDragging,
        selectionBox,
    };
};
