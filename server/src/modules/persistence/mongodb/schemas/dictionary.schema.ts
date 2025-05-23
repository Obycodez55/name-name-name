import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DictionaryDocument = Dictionary & Document;

@Schema({ timestamps: true })
export class Dictionary {
  @Prop({ required: true, unique: true, lowercase: true })
  category: string;

  @Prop([{ type: String, lowercase: true }])
  words: string[];

  @Prop({ default: 0 })
  wordCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DictionarySchema = SchemaFactory.createForClass(Dictionary);

// Create indexes
DictionarySchema.index({ category: 1 }, { unique: true });
DictionarySchema.index({ words: 1 });
DictionarySchema.index({ category: 1, words: 1 });

// Update wordCount before saving
DictionarySchema.pre('save', function(next) {
  if (this.isModified('words')) {
    this.wordCount = this.words.length;
  }
  next();
});