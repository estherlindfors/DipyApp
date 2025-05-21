document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = button.querySelector('.faq-icon');

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Close all other FAQ items for a true accordion behavior (optional)
            // faqItems.forEach(otherItem => {
            //     if (otherItem !== item) {
            //         const otherButton = otherItem.querySelector('.faq-question');
            //         const otherAnswer = otherItem.querySelector('.faq-answer');
            //         const otherIcon = otherButton.querySelector('.faq-icon');
            //         otherButton.setAttribute('aria-expanded', 'false');
            //         otherAnswer.classList.add('hidden');
            //         if (otherIcon) otherIcon.classList.remove('rotate-45'); // Or textContent = '+'
            //         // For rounded corners adjustment if you had separate top/bottom rounding
            //         // otherButton.classList.add('rounded-lg');
            //         // otherButton.classList.remove('rounded-b-none'); 
            //     }
            // });
            
            button.setAttribute('aria-expanded', !isExpanded);
            answer.classList.toggle('hidden');
            
            if (icon) {
                // Example using class for rotation:
                icon.classList.toggle('rotate-3', !isExpanded);
                // Or if you prefer text change:
                // icon.textContent = isExpanded ? '+' : '−'; 
            }

            // Adjust button rounding if it's not part of a combined rounded container
            // This example assumes the button is always rounded-lg or gets specific classes when open
            // If the .faq-item itself is rounded and answer is inside, this might not be needed.
            // My HTML structure uses rounded-lg on the button and on the item,
            // so dynamic class changes for rounding are less critical here.
            // If you make the answer border part of the button when open:
            if (!isExpanded) { // When opening
                button.classList.add('rounded-b-none'); // If answer appears directly below, no bottom rounding on button
            } else { // When closing
                button.classList.remove('rounded-b-none');
            }
             // If the answer is hidden, the button should be fully rounded.
            if (answer.classList.contains('hidden')) {
                button.classList.add('rounded-lg');
                button.classList.remove('rounded-b-none');
            } else {
                 button.classList.remove('rounded-lg');
                 button.classList.add('rounded-t-lg'); // Ensure only top is rounded when open
            }


        });
        // Ensure initial state is correct (button fully rounded if answer hidden)
        if (answer.classList.contains('hidden')) {
            button.classList.add('rounded-lg');
        } else {
            button.classList.remove('rounded-lg');
            button.classList.add('rounded-t-lg');
        }
    });

   // "Add your own activity" Form Mailto Logic
const addActivityForm = document.getElementById('add-activity-form');
if (addActivityForm) {
    addActivityForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('activity-title').value;
        const description = document.getElementById('activity-description').value;
        const location = document.getElementById('activity-location').value;
        const participants = document.getElementById('activity-participants').value;
        const price = document.getElementById('activity-price').value;

        const subject = `Dipy - New Activity Suggestion: ${title}`; // Subject can be encoded separately

        // 1. Construct the body string with raw values and \n for newlines
        const rawBody = `Hello Dipy Team,\n\nI'd like to suggest a new activity:\n\n` +
                      `Activity Title: ${title}\n` +                 // Use raw title here
                      `Description: ${description}\n` +           // Use raw description here
                      `Location: ${location}\n` +                 // Use raw location here
                      `Possible Participants: ${participants}\n` + // Use raw participants here
                      `Price: ${price}\n\n` +                       // Use raw price here
                      `Thanks!\n`;

        // 2. Encode the entire rawBody string for the mailto link
        const encodedBody = encodeURIComponent(rawBody);
        const encodedSubject = encodeURIComponent(subject);

        let mailtoLink = `mailto:to.dipy.app@gmail.com?subject=${encodedSubject}&body=${encodedBody}`;

        if (mailtoLink.length > 2000) {
            alert('The generated email content is too long. Please shorten your descriptions or title.');
            return;
        }

        window.location.href = mailtoLink;
    });
}
});