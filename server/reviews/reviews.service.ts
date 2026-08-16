import { Review } from '../../lib/types';
import { initialReviews } from '../../lib/mockData';
import { PsychiatristsService } from '../psychiatrists/psychiatrists.service';

export class ReviewsService {
  private reviews: Review[] = [...initialReviews];

  constructor(private readonly psychiatristsService: PsychiatristsService) {}

  findAll(): Review[] {
    return this.reviews;
  }

  addReview(doctorId: string, rating: number, text: string, patientName?: string): Review {
    let docName = 'Psychiatrist';
    try {
      const doc = this.psychiatristsService.findOne(doctorId);
      docName = doc.name;
    } catch (e) {}

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      doctorId,
      doctorName: docName,
      patientName: patientName || 'Verified Patient',
      patientDistrict: 'Colombo',
      rating,
      date: new Date().toISOString().split('T')[0],
      text,
      isVerified: true,
      helpfulCount: 0,
    };

    this.reviews = [newReview, ...this.reviews];
    return newReview;
  }

  voteHelpful(reviewId: string): Review {
    let updated: Review | undefined;
    this.reviews = this.reviews.map((r) => {
      if (r.id === reviewId) {
        updated = { ...r, helpfulCount: r.helpfulCount + 1 };
        return updated;
      }
      return r;
    });
    if (!updated) throw new Error('Review not found');
    return updated;
  }

  flagReview(reviewId: string, note?: string): Review {
    let updated: Review | undefined;
    this.reviews = this.reviews.map((r) => {
      if (r.id === reviewId) {
        updated = { ...r, flagged: true, adminNote: note || 'Flagged for audit review' };
        return updated;
      }
      return r;
    });
    if (!updated) throw new Error('Review not found');
    return updated;
  }
}
