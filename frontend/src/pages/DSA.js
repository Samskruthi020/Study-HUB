import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const DSA = () => {
  return (
    <Container className="mt-4">
      <h2>📗 Data Structures & Algorithms</h2>
      <p className="text-muted">Learn the fundamentals and advanced topics to crack coding interviews and build efficient software.</p>

      {/* Section 1: Overview */}
      <Card className="my-4">
        <Card.Body>
          <Card.Title>🔍 Overview</Card.Title>
          <Card.Text>
            DSA is a key subject covering data organization and problem-solving techniques.
            Topics include Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, and Dynamic Programming.
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Section 2: Notes */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>📒 Downloadable Notes</Card.Title>
          <ul>
            <li><a href="/pdfs/dsa-basics.pdf" target="_blank">DSA Basics</a></li>
            <li><a href="/pdfs/dsa-advanced.pdf" target="_blank">Advanced Algorithms</a></li>
          </ul>
        </Card.Body>
      </Card>

      {/* Section 3: Video Lectures */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>🎥 Video Resources</Card.Title>
          <ul>
            <li><a href="https://youtube.com/playlist?list=PLACtTSY9gOZfWWvHlZ3ks0yzsFOvqUjGm" target="_blank" rel="noreferrer">CodeHelp DSA Playlist</a></li>
            <li><a href="https://www.codingninjas.com/courses/data-structures-in-cpp" target="_blank" rel="noreferrer">Coding Ninjas - DSA</a></li>
          </ul>
        </Card.Body>
      </Card>

      {/* Section 4: Practice Platforms */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>💻 Practice Platforms</Card.Title>
          <ul>
            <li><a href="https://leetcode.com" target="_blank">LeetCode</a></li>
            <li><a href="https://www.codeforces.com" target="_blank">Codeforces</a></li>
            <li><a href="https://practice.geeksforgeeks.org" target="_blank">GFG Practice</a></li>
          </ul>
        </Card.Body>
      </Card>

      {/* Section 5: Quiz (Coming Soon) */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>🧪 Quiz Zone</Card.Title>
          <Card.Text>Interactive DSA quizzes will be available soon with detailed solutions!</Card.Text>
        </Card.Body>
      </Card>

      {/* Section 6: Interview Q&A */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>💼 Interview Prep</Card.Title>
          <ul>
            <li><strong>Q:</strong> What is the difference between stack and queue?</li>
            <li><strong>A:</strong> Stack is LIFO, queue is FIFO. Both are linear data structures.</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DSA;
