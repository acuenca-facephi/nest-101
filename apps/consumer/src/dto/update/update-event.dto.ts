import { PartialType } from "@nestjs/mapped-types";
import { Event } from "../../entities/event.entity";

export class UpdateEventDto extends PartialType(Event) {}
