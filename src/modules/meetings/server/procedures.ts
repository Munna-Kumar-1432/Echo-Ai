import { db } from "@/db";
import { z } from "zod";
import { meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { DEFAULT_PAE_SIZE, DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constant";
import { meetingsInsertSchema, mettingsUpdateSchema } from "../schemas";

export const meetingsRouter = createTRPCRouter({
    update: protectedProcedure
        .input(mettingsUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const [updatedMeeting] = await db
                .update(meetings)
                .set(input)
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                )
                .returning()

            if (!updatedMeeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found !!" })
            }
            return updatedMeeting
        })
    ,

    create: protectedProcedure
        .input(meetingsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdMeeting] = await db
                .insert(meetings)
                .values({
                    ...input,
                    userId: ctx.auth.user.id,
                })
                .returning();



            return createdMeeting;
        }),

    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const [existingMeeting] = await db
                .select({
                    ...getTableColumns(meetings),
                })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                )

            if (!existingMeeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found !!" })
            }

            return existingMeeting;
        }),
    getMany: protectedProcedure
        .input(
            z
                .object({
                    page: z.number().default(DEFAULT_PAGE),
                    pageSize: z
                        .number()
                        .min(MIN_PAGE_SIZE)
                        .max(MAX_PAGE_SIZE)
                        .default(DEFAULT_PAE_SIZE),
                    search: z.string().nullish(),
                })

        )
        .query(async ({ ctx, input }) => {
            const { page, search, pageSize } = input
            const data = await db
                .select({ meetingCount: sql<number>`6`, ...getTableColumns(meetings) })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                )
                .orderBy(desc(meetings.createdAt), desc(meetings.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize)


            const [total] = await db
                .select({ count: count() })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                )

            const totalPages = Math.ceil(total.count / pageSize)

            return {
                items: data,
                total: total.count,
                totalPages
            }
        }),


});
