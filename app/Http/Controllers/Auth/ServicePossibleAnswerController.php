<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\ServicesModel;
use App\Models\ContactedLeadsModel;
use App\Models\UserServicesModel;
use App\Models\LeadsModel;
use App\Models\ServiceQuestionModel;
use App\Models\ServicePossibleAnswerModel;
use App\Http\Controllers\ProfileController; 
use Illuminate\Support\Facades\DB;
use App\Models\ServicePossibleAnswer;
use App\Models\ServiceQuestion;

class ServicePossibleAnswerController extends Controller
{
 
    public function create()
    {
        $questions = ServiceQuestion::all(); 
        return view('service_possible_answers.create', compact('questions'));
    }


    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'service_question_id' => 'required|exists:service_questions,id',
            'service_possible_answers' => 'required|string|max:255',
            'entered_by' => 'nullable|string|max:50',
            'status' => 'nullable|integer',
        ]);

        ServicePossibleAnswer::create([
            'service_question_id' => $request->service_question_id,
            'service_possible_answers' => $request->service_possible_answers,
            'date_entered' => now(),
            'entered_by' => $request->entered_by ?? 'system',
            'status' => $request->status ?? 1,
        ]);

        return redirect()->route('service_possible_answers.index')->with('success', 'Possible answer created successfully.');
    }

    
    public function index()
    {
        $possibleAnswers = ServicePossibleAnswer::with('question')->get();
        return view('service_possible_answers.index', compact('possibleAnswers'));
    }
    public function possibleAnswers()
{
    return $this->hasMany(ServicePossibleAnswer::class, 'service_question_id');
}

}
