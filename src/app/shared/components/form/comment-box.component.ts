import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-comment-box',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div class="flex gap-4">
        <img class="inline-block h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" 
            src="https://ui-avatars.com/api/?name=Admin&background=random" 
            alt="User Avatar">
        <div class="flex-1">
          <textarea rows="3" 
            [(ngModel)]="comment"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-main focus:ring-brand-main sm:text-sm p-3 resize-none bg-white" 
            [placeholder]="placeholder"></textarea>
            
          <div class="mt-3 flex justify-end">
             <button type="button" 
                (click)="onSubmit()"
                [disabled]="!comment.trim()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-main hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-main disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Add Note
             </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommentBoxComponent {
    @Input() placeholder = 'Add a generic note or comment...';
    @Output() submitComment = new EventEmitter<string>();

    comment = '';

    onSubmit() {
        if (this.comment.trim()) {
            this.submitComment.emit(this.comment);
            this.comment = '';
        }
    }
}
