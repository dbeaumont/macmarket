import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-gray-200 mt-16 py-8">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500">
        <p class="font-medium mb-1">MacMarket &copy; {{ year }}</p>
        <p>Le meilleur du Mac, au meilleur prix.</p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
