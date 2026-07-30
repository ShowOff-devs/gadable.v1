<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_plan_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_plan_id')->constrained()->restrictOnDelete();
            $table->foreignId('subscription_plan_version_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action')->index();
            $table->string('outcome')->default('success');
            $table->string('previous_status')->nullable();
            $table->string('new_status')->nullable();
            $table->json('changed_fields')->nullable();
            $table->text('reason')->nullable();
            $table->uuid('reference')->unique();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['subscription_plan_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_events');
    }
};
