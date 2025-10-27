import React from 'react';

const FAQ = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 shadow p-4 rounded bg-light">
          <h2 className="text-center mb-4">Frequently Asked Questions</h2>

          <div className="accordion" id="faqAccordion">

            <div className="accordion-item">
              <h2 className="accordion-header" id="faqOne">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  What is StudyHub?
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse show"
                aria-labelledby="faqOne"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  StudyHub is a centralized platform for students to access notes, quizzes, and learning resources for various subjects.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faqTwo">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  How can I take a quiz?
                </button>
              </h2>
              <div
                id="collapseTwo"
                className="accordion-collapse collapse"
                aria-labelledby="faqTwo"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  Navigate to the "Quiz" section, select your subject, and begin the quiz. Your scores will be stored for review.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="faqThree">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  Can I submit my own notes or resources?
                </button>
              </h2>
              <div
                id="collapseThree"
                className="accordion-collapse collapse"
                aria-labelledby="faqThree"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  This feature will be available soon! Stay tuned for the update where you'll be able to contribute your content.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
